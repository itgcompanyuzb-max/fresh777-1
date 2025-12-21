import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Customer } from "@shared/schema";

export function useCustomerAuth() {
  const [, navigate] = useLocation();
  
  const { data: customer, isLoading } = useQuery<Customer>({
    queryKey: ["/api/customers/me"],
  });

  useEffect(() => {
    if (!isLoading && (!customer || !customer.phoneNumber)) {
      // User not registered, redirect to signup
      navigate("/signup");
    }
  }, [customer, isLoading, navigate]);

  return { customer, isLoading };
}
