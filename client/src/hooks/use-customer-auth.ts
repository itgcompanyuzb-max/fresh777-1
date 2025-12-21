import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";

/**
 * Hook that fetches the current customer info without redirecting.
 * Use this for pages that should be accessible to non-authenticated users
 * (like catalog, product details, etc).
 */
export function useCustomerAuth() {
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ["/api/customers/me"],
  });

  return { customer, isLoading };
}
