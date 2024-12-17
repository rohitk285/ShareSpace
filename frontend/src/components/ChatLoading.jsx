import { Skeleton } from "@mui/material";
import { Stack } from "@mui/system";

const ChatLoading = () => {
  return (
    <Stack spacing={1}>
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
      <Skeleton variant="rectangular" height={45} />
    </Stack>
  );
};

export default ChatLoading;
