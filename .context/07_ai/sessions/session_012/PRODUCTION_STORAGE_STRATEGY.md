# Production Storage Strategy - Elemnt Rentals

## Current Status: Phase 1 (Local Storage with Subdirectories)

This document outlines the storage architecture for the Elemnt Rentals platform, covering the current implementation and future production strategy.

---

## 📋 Overview

### Current Implementation (v1.0.1)
- **Storage Type**: Local file system
- **Base Directory**: `backend/uploads/`
- **Structure**: Organized subdirectories by media type
  ```
  uploads/
  └── properties/
      ├── {property_id}_{uuid}.jpg
      ├── {property_id}_{uuid}.png
      └── ...
  ```
- **URL Format**: `/uploads/properties/{filename}`
- **Serving**: FastAPI `StaticFiles` middleware

### Design Principles
1. **Organized Structure**: Subdirectories for different media types (properties, avatars, documents)
2. **Scalable Interface**: `StorageProvider` protocol allows easy migration to cloud storage
3. **Security First**: Path traversal validation, magic number verification
4. **Production Ready**: Architecture supports seamless cloud migration

---

## 🏗️ Architecture

### Storage Provider Interface

```python
class StorageProvider(Protocol):
    def upload_file(self, file: UploadFile, destination: str) -> str:
        ...
```

### Current Implementation: LocalStorageProvider

**Location**: `backend/app/media/storage.py`

```python
class LocalStorageProvider:
    def __init__(self, upload_dir: str = "uploads/properties"):
        self.upload_dir = upload_dir
        os.makedirs(self.upload_dir, exist_ok=True)

    def upload_file(self, file: UploadFile, filename: str) -> str:
        file_path = os.path.join(self.upload_dir, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return f"/uploads/properties/{filename}"
```

### Provider Factory

```python
def get_storage_provider() -> StorageProvider:
    # Phase 1: Local storage
    # Phase 2: Cloud storage based on environment
    return LocalStorageProvider()
```

---

## 🚀 Production Deployment Strategy

### Deployment Scenarios

#### Option 1: Single Server Deployment (Simple)
**Best for**: MVP, small-scale deployments, single-region applications

**Architecture:**
- Single VPS/dedicated server
- Local file storage with subdirectories
- Nginx reverse proxy serving static files
- Regular backups to cloud storage

**Pros:**
- Simple setup and maintenance
- No cloud storage costs
- Fast local file access
- Easy to debug

**Cons:**
- Not scalable to multiple servers
- Manual backup management
- No CDN benefits
- Server storage limits

**Recommended Setup:**
```nginx
# Nginx configuration
location /uploads/ {
    alias /var/www/elemnt-rentals/backend/uploads/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

#### Option 2: Cloud Storage (Recommended for Production)
**Best for**: Multi-server deployments, scalability, global reach

**Architecture:**
- Cloud storage bucket (S3, GCS, Azure Blob)
- CDN for global distribution
- Multiple application servers
- Automatic backups and versioning

**Pros:**
- Infinite scalability
- CDN for fast global delivery
- Automatic backups and redundancy
- No server storage concerns
- Multi-server compatible

**Cons:**
- Cloud storage costs
- Additional complexity
- Requires cloud provider setup

**Recommended Providers:**
1. **AWS S3** + CloudFront CDN
2. **Google Cloud Storage** + Cloud CDN
3. **Azure Blob Storage** + Azure CDN

#### Option 3: Hybrid Approach
**Best for**: Gradual migration, testing, development

**Architecture:**
- Local storage for development
- Cloud storage for staging/production
- Environment-based provider selection

**Implementation:**
```python
def get_storage_provider() -> StorageProvider:
    if settings.STORAGE_TYPE == "s3":
        return S3StorageProvider(
            bucket=settings.S3_BUCKET,
            region=settings.S3_REGION
        )
    elif settings.STORAGE_TYPE == "gcs":
        return GCSStorageProvider(
            bucket=settings.GCS_BUCKET
        )
    else:
        return LocalStorageProvider()
```

---

## 📊 Comparison Matrix

| Feature | Local Storage | Cloud Storage (S3/GCS) |
|---------|---------------|------------------------|
| **Setup Complexity** | Low | Medium |
| **Scalability** | Single server only | Unlimited |
| **Cost** | Server storage only | Pay per GB + requests |
| **Performance** | Fast (local) | Fast (CDN) |
| **Reliability** | Single point of failure | 99.99% SLA |
| **Backups** | Manual | Automatic |
| **Multi-Server** | ❌ No | ✅ Yes |
| **CDN Support** | Requires setup | Native |
| **Best For** | MVP, single server | Production, scale |

---

## 🎯 Recommended Path Forward

### Phase 1: v1.0.1 (Current)
**Status**: ✅ COMPLETE

- [x] Local storage with organized subdirectories
- [x] `StorageProvider` interface
- [x] Path traversal security
- [x] File signature validation
- [x] Consistent URL structure

**Deployment**: Single server with local storage

### Phase 2: Cloud Migration (Future)
**Timeline**: Before scaling to multiple servers

**Implementation Steps:**

1. **Create Cloud Storage Implementation**
   ```python
   # backend/app/media/storage.py
   
   class S3StorageProvider:
       def __init__(self, bucket: str, region: str):
           self.s3_client = boto3.client('s3', region_name=region)
           self.bucket = bucket
           self.cdn_url = settings.CDN_URL
       
       def upload_file(self, file: UploadFile, filename: str) -> str:
           # Upload to S3 with properties/ prefix
           key = f"properties/{filename}"
           self.s3_client.upload_fileobj(
               file.file,
               self.bucket,
               key,
               ExtraArgs={'ContentType': file.content_type}
           )
           # Return CDN URL
           return f"{self.cdn_url}/{key}"
   ```

2. **Update Configuration**
   ```python
   # backend/app/config.py
   
   class Settings(BaseSettings):
       # Storage configuration
       STORAGE_TYPE: str = "local"  # local, s3, gcs
       
       # S3 configuration
       S3_BUCKET: Optional[str] = None
       S3_REGION: Optional[str] = None
       CDN_URL: Optional[str] = None
   ```

3. **Environment Variables**
   ```bash
   # Production .env
   STORAGE_TYPE=s3
   S3_BUCKET=elemnt-rentals-media
   S3_REGION=us-east-1
   CDN_URL=https://cdn.elemnt-rentals.com
   ```

4. **Migration Script**
   - Upload existing files from `uploads/properties/` to S3
   - Update database URLs to use CDN URLs
   - Verify all images accessible
   - Remove local files

---

## 🔒 Security Considerations

### Current (Local Storage)
- ✅ Path traversal validation
- ✅ File signature verification (magic numbers)
- ✅ Audit logging
- ✅ RBAC for uploads/deletes

### Cloud Storage (Additional)
- Bucket policies (private by default)
- Signed URLs for temporary access
- CORS configuration
- Encryption at rest
- Access logging

---

## 💰 Cost Estimation (Cloud Storage)

### AWS S3 Example (1000 properties, avg 5 images each)

**Storage:**
- 5,000 images × 500KB avg = 2.5GB
- S3 Standard: $0.023/GB/month
- **Cost**: ~$0.06/month

**Data Transfer:**
- 10,000 views/month × 500KB = 5GB
- CloudFront: $0.085/GB
- **Cost**: ~$0.43/month

**Requests:**
- 10,000 GET requests
- S3: $0.0004 per 1,000 requests
- **Cost**: ~$0.004/month

**Total**: ~$0.50/month for small scale
**At Scale** (100K properties): ~$50/month

---

## 📝 Decision Points

### When to Use Local Storage
- ✅ MVP/prototype phase
- ✅ Single server deployment
- ✅ Budget constraints
- ✅ Simple setup preferred
- ✅ Low traffic (<1000 users/month)

### When to Migrate to Cloud
- ✅ Scaling to multiple servers
- ✅ Global user base (need CDN)
- ✅ High traffic (>10K users/month)
- ✅ Need automatic backups
- ✅ Compliance requirements (data redundancy)

---

## 🎬 Next Steps

### Immediate (v1.0.1)
1. ✅ Fix path mismatch (COMPLETE)
2. ✅ Document current architecture (COMPLETE)
3. [ ] QA re-validation
4. [ ] Deploy to production with local storage

### Short-term (v1.1.0)
1. [ ] Monitor storage usage
2. [ ] Set up automated backups
3. [ ] Document backup/restore procedures

### Long-term (v2.0.0)
1. [ ] Implement S3StorageProvider
2. [ ] Set up CloudFront CDN
3. [ ] Create migration script
4. [ ] Test cloud storage in staging
5. [ ] Migrate production to cloud

---

## 📚 Resources

### Documentation
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Google Cloud Storage](https://cloud.google.com/storage/docs)
- [FastAPI StaticFiles](https://fastapi.tiangolo.com/tutorial/static-files/)

### Implementation Examples
- `backend/app/media/storage.py` - Current implementation
- `backend/app/properties/service.py` - Usage example

---

**Architect**: Ready for production deployment discussion
**Date**: 2026-01-24
**Status**: Phase 1 Complete, Phase 2 Planned
