import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";

/**
 * Hook that requires authentication and redirects to login if not authenticated.
 * Use this for protected pages like Cart, Checkout, Chat, etc.
 */
export function useCustomerAuthRequired() {
  const [, navigate] = useLocation();
  
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ["/api/customers/me"],
  });

  useEffect(() => {
    if (!isLoading && (!customer || !customer.phoneNumber)) {
      // User not registered, redirect to login
      navigate("/login");
    }
  }, [customer, isLoading, navigate]);

  return { customer, isLoading };
}
