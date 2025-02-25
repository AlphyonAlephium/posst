
export const MAX_DURATION = 5; // Maximum duration in hours

export const validateHotDealForm = (
  title: string,
  description: string,
  startTime: string,
  duration: number,
  selectedFile: File | null
): { isValid: boolean; errorMessage?: string } => {
  if (!title || !description || !startTime || !selectedFile) {
    return {
      isValid: false,
      errorMessage: "Please fill in all fields and upload an image"
    };
  }

  if (duration <= 0 || duration > MAX_DURATION) {
    return {
      isValid: false,
      errorMessage: `Duration must be between 1 and ${MAX_DURATION} hours`
    };
  }

  return { isValid: true };
};
