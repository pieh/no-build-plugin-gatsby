import * as React from "react";
import { Layout } from "../../../components/layout";

export default function DSG() {
  return <Layout>Hello DSG!</Layout>;
}

export function config() {
  return () => {
    return {
      defer: true,
    };
  };
}
