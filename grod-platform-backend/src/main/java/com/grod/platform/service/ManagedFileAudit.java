package com.grod.platform.service;

public record ManagedFileAudit(long physicalFiles, long referencedFiles, long potentialOrphans, long reclaimableBytes) {
}
