import { downloadCloudProductsToLocal } from "./cloudProductDownloadService";
import { downloadCloudTransactionsToLocal } from "./cloudTransactionDownloadService";
import { syncLocalProductsToCloud } from "./productSyncService";
import { syncLocalTransactionsToCloud } from "./transactionSyncService";

export interface CloudPushResult {
  productUpload: Awaited<
    ReturnType<
      typeof syncLocalProductsToCloud
    >
  >;

  transactionUpload: Awaited<
    ReturnType<
      typeof syncLocalTransactionsToCloud
    >
  >;
}

export interface CloudPullResult {
  productDownload: Awaited<
    ReturnType<
      typeof downloadCloudProductsToLocal
    >
  >;

  transactionDownload: Awaited<
    ReturnType<
      typeof downloadCloudTransactionsToLocal
    >
  >;
}

export async function pushInventoryToCloud(): Promise<
  CloudPushResult
> {
  /*
   * Products go first so the cloud
   * already knows about the product
   * before its transactions are uploaded.
   */
  const productUpload =
    await syncLocalProductsToCloud();

  const transactionUpload =
    await syncLocalTransactionsToCloud();

  return {
    productUpload,
    transactionUpload,
  };
}

export async function pullInventoryFromCloud(): Promise<
  CloudPullResult
> {
  /*
   * Products must download first because
   * transactions need the matching local
   * product to exist.
   */
  const productDownload =
    await downloadCloudProductsToLocal();

  const transactionDownload =
    await downloadCloudTransactionsToLocal();

  return {
    productDownload,
    transactionDownload,
  };
}