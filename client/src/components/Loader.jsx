import { Box, Skeleton, Container } from "@mui/material";

export default function Loader() {
  return (
    <Container maxWidth="xl" sx={{ py: 8 }}>
      <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 6 }} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 3,
        }}
      >
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={280} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    </Container>
  );
}