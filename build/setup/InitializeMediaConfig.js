import { CommonConfig, DraxConfig } from '@drax/common-back';
export default function InitializeMediaConfig() {
    // Installed Drax StoreManager falls back to 1 byte when no limit is set.
    if (!DraxConfig.getOrLoad(CommonConfig.MaxUploadSize)) {
        DraxConfig.set(CommonConfig.MaxUploadSize, 5 * 1024 * 1024);
    }
}
