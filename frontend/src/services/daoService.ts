import { ethers } from "ethers";
import daomanagerabi from "../utils/abis/DAOManager.json";
import governancetokenabi from "../utils/abis/GovernanceToken.json";
import { createSafeContract } from "../utils/u2uProvider";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const BATCH_SIZE = 10; // Load 10 DAOs in parallel

interface CacheEntry {
  data: any;
  timestamp: number;
}

class DAOService {
  private cache: Map<string, CacheEntry> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();

  // Clear cache
  clearCache() {
    this.cache.clear();
  }

  // Invalidate specific cache entry
  invalidate(key: string) {
    this.cache.delete(key);
  }

  // Get from cache or fetch
  private async getCached<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = CACHE_DURATION
  ): Promise<T> {
    // Check cache
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < ttl) {
      console.log(`✅ Cache hit: ${key}`);
      return cached.data as T;
    }

    // Check if already loading
    if (this.loadingPromises.has(key)) {
      console.log(`⏳ Waiting for existing request: ${key}`);
      return this.loadingPromises.get(key) as Promise<T>;
    }

    // Fetch and cache
    console.log(`🔄 Cache miss, fetching: ${key}`);
    const promise = fetcher()
      .then((data) => {
        this.cache.set(key, { data, timestamp: Date.now() });
        this.loadingPromises.delete(key);
        return data;
      })
      .catch((error) => {
        this.loadingPromises.delete(key);
        throw error;
      });

    this.loadingPromises.set(key, promise);
    return promise;
  }

  // Load single DAO with all details
  async loadDAO(
    daoId: number,
    contract: any,
    signer: any
  ): Promise<any | null> {
    const cacheKey = `dao:${daoId}`;

    return this.getCached(cacheKey, async () => {
      try {
        console.log(`📋 Loading DAO ${daoId}...`);

        // Load DAO info
        const daoInfo = await contract.daoIdtoDao(daoId);
        
        // Load creator info
        const creatorId = Number(daoInfo.creator);
        const creatorInfo = await contract.userIdtoUser(creatorId);

        // Load token info
        const tokenAddress = daoInfo.governanceTokenAddress;
        const tokenContract = createSafeContract(
          tokenAddress,
          governancetokenabi,
          signer
        );

        // Parallel token calls
        const [tokenName, tokenSymbol] = await Promise.all([
          tokenContract.name(),
          tokenContract.symbol(),
        ]);

        // Load members
        const members = await contract.getAllDaoMembers(daoId);

        return {
          daoInfo,
          creatorInfo,
          tokenName,
          tokenSymbol,
          totalDaoMembers: members.length,
        };
      } catch (error) {
        console.error(`❌ Error loading DAO ${daoId}:`, error);
        return null;
      }
    });
  }

  // Load DAOs in batches with parallel processing
  async loadDAOsBatch(
    startId: number,
    endId: number,
    contract: any,
    signer: any,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<any[]> {
    const total = endId - startId + 1;
    const results: any[] = [];

    console.log(`📦 Loading DAOs ${startId} to ${endId} (${total} total)`);

    // Split into smaller batches for parallel processing
    const batches = Math.ceil(total / BATCH_SIZE);

    for (let batch = 0; batch < batches; batch++) {
      const batchStart = startId + batch * BATCH_SIZE;
      const batchEnd = Math.min(batchStart + BATCH_SIZE - 1, endId);

      console.log(`🔄 Processing batch ${batch + 1}/${batches} (DAOs ${batchStart}-${batchEnd})`);

      // Load batch in parallel
      const promises = [];
      for (let i = batchStart; i <= batchEnd; i++) {
        promises.push(this.loadDAO(i, contract, signer));
      }

      const batchResults = await Promise.allSettled(promises);

      // Process results
      batchResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value !== null) {
          results.push(result.value);
        } else if (result.status === "rejected") {
          console.error(`Failed to load DAO ${batchStart + index}:`, result.reason);
        }
      });

      // Report progress
      if (onProgress) {
        onProgress(results.length, total);
      }
    }

    console.log(`✅ Loaded ${results.length}/${total} DAOs successfully`);
    return results;
  }

  // Get total DAO count with caching
  async getTotalDAOs(contract: any): Promise<number> {
    return this.getCached("total:daos", async () => {
      const total = await contract.totalDaos();
      return Number(total);
    }, 60 * 1000); // Cache for 1 minute
  }

  // Load DAOs with pagination
  async loadDAOsPage(
    page: number,
    pageSize: number,
    contract: any,
    signer: any,
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ daos: any[]; total: number; hasMore: boolean }> {
    const total = await this.getTotalDAOs(contract);
    
    if (total === 0) {
      return { daos: [], total: 0, hasMore: false };
    }

    const startId = (page - 1) * pageSize + 1;
    const endId = Math.min(page * pageSize, total);

    if (startId > total) {
      return { daos: [], total, hasMore: false };
    }

    const daos = await this.loadDAOsBatch(
      startId,
      endId,
      contract,
      signer,
      onProgress
    );

    return {
      daos,
      total,
      hasMore: endId < total,
    };
  }

  // Search DAOs (client-side for now, will be server-side with subgraph)
  async searchDAOs(
    query: string,
    contract: any,
    signer: any
  ): Promise<any[]> {
    const total = await this.getTotalDAOs(contract);
    const allDAOs = await this.loadDAOsBatch(1, total, contract, signer);

    const lowerQuery = query.toLowerCase();
    return allDAOs.filter((dao) => {
      if (!dao) return false;
      const name = dao.daoInfo?.daoName?.toLowerCase() || "";
      const creator = dao.creatorInfo?.userName?.toLowerCase() || "";
      const token = dao.tokenName?.toLowerCase() || "";
      return name.includes(lowerQuery) || creator.includes(lowerQuery) || token.includes(lowerQuery);
    });
  }

  // Prefetch next page for smooth infinite scroll
  async prefetchNextPage(
    currentPage: number,
    pageSize: number,
    contract: any,
    signer: any
  ) {
    const nextPage = currentPage + 1;
    const total = await this.getTotalDAOs(contract);
    const startId = (nextPage - 1) * pageSize + 1;

    if (startId <= total) {
      console.log(`🔮 Prefetching page ${nextPage}...`);
      // Load in background, don't await
      this.loadDAOsPage(nextPage, pageSize, contract, signer).catch((err) =>
        console.error("Prefetch failed:", err)
      );
    }
  }
}

// Singleton instance
export const daoService = new DAOService();

// Export for use in components
export default daoService;
