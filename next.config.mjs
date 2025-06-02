import withPWA from "@ducanh2912/next-pwa";

const nextConfig = {
  reactStrictMode: true
};

export default withPWA({
  dest: "public",
})(nextConfig);