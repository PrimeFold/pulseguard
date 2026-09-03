import { GlobalLoader } from "@/components/ui/GlobalLoader";

export default function Loading() {
  return <GlobalLoader message="AUTHENTICATING UPLINK..." fullScreen={false} />;
}
