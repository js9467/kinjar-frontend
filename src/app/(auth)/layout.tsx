import Providers from "../providers";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>;
}
