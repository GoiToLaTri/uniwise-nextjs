export const THUMBNAIL_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const VIDEO_MAX_SIZE_BYTES = 200 * 1024 * 1024;

export const THUMBNAIL_FILE_ACCEPT =
  ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
export const VIDEO_FILE_ACCEPT = ".mp4,video/mp4";

interface UploadFileType {
  extensions: ReadonlySet<string>;
  mimeType: string;
}

const THUMBNAIL_FILE_TYPES: readonly UploadFileType[] = [
  {
    extensions: new Set(["jpg", "jpeg"]),
    mimeType: "image/jpeg",
  },
  {
    extensions: new Set(["png"]),
    mimeType: "image/png",
  },
  {
    extensions: new Set(["webp"]),
    mimeType: "image/webp",
  },
];

const VIDEO_FILE_TYPES: readonly UploadFileType[] = [
  {
    extensions: new Set(["mp4"]),
    mimeType: "video/mp4",
  },
];

export interface UploadFileValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Lấy extension cuối cùng trong tên tệp và chuẩn hóa về chữ thường.
 */
function getFileExtension(fileName: string): string | null {
  const lastDotIndex = fileName.lastIndexOf(".");

  if (lastDotIndex <= 0 || lastDotIndex === fileName.length - 1) {
    return null;
  }

  return fileName.slice(lastDotIndex + 1).toLowerCase();
}

/**
 * Kiểm tra đồng thời extension, MIME và kích thước giống các bước mà
 * media-service áp dụng trước khi lưu tệp.
 *
 * Frontend không thể kiểm tra chữ ký nhị phân đáng tin cậy như backend, nên
 * backend vẫn là nơi quyết định cuối cùng tệp có hợp lệ hay không.
 */
function validateUploadFile({
  file,
  allowedTypes,
  maxSize,
  invalidExtensionMessage,
  invalidMimeMessage,
  tooLargeMessage,
}: {
  file: File;
  allowedTypes: readonly UploadFileType[];
  maxSize: number;
  invalidExtensionMessage: string;
  invalidMimeMessage: string;
  tooLargeMessage: string;
}): UploadFileValidationResult {
  if (file.size === 0) {
    return {
      isValid: false,
      message: "Tệp đã chọn đang trống. Vui lòng chọn tệp khác.",
    };
  }

  if (file.size > maxSize) {
    return { isValid: false, message: tooLargeMessage };
  }

  const extension = getFileExtension(file.name);
  const expectedType = extension
    ? allowedTypes.find((type) => type.extensions.has(extension))
    : undefined;

  if (!expectedType) {
    return { isValid: false, message: invalidExtensionMessage };
  }

  if (file.type.trim().toLowerCase() !== expectedType.mimeType) {
    return { isValid: false, message: invalidMimeMessage };
  }

  return { isValid: true };
}

/**
 * Xác nhận ảnh bìa là JPG/JPEG, PNG hoặc WEBP và không vượt quá 10 MB.
 */
export function validateThumbnailFile(
  file: File,
): UploadFileValidationResult {
  return validateUploadFile({
    file,
    allowedTypes: THUMBNAIL_FILE_TYPES,
    maxSize: THUMBNAIL_MAX_SIZE_BYTES,
    invalidExtensionMessage: "Chỉ hỗ trợ ảnh JPG, JPEG, PNG hoặc WEBP.",
    invalidMimeMessage:
      "Loại nội dung của ảnh không khớp với phần mở rộng tệp.",
    tooLargeMessage: "Dung lượng ảnh tối đa là 10 MB.",
  });
}

/**
 * Xác nhận video là MP4 với MIME `video/mp4` và không vượt quá 200 MB.
 */
export function validateVideoFile(file: File): UploadFileValidationResult {
  return validateUploadFile({
    file,
    allowedTypes: VIDEO_FILE_TYPES,
    maxSize: VIDEO_MAX_SIZE_BYTES,
    invalidExtensionMessage: "Chỉ hỗ trợ video định dạng MP4.",
    invalidMimeMessage:
      "Loại nội dung của video không khớp với định dạng MP4.",
    tooLargeMessage: "Dung lượng video tối đa là 200 MB.",
  });
}
