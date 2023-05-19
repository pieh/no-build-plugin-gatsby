import * as React from "react";
import { Layout } from "../../../components/layout";

export default function DSG({ params }) {
  return (
    <Layout>
      Hello DSG!
      <pre>{JSON.stringify({ params }, null, 2)}</pre>
    </Layout>
  );
}

export function config() {
  return () => {
    return {
      defer: true,
    };
  };
}
