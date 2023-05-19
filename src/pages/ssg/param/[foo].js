import * as React from "react";
import { Layout } from "../../../components/layout";

export default function SSG({ params }) {
  return (
    <Layout>
      Hello SSG!
      <pre>{JSON.stringify({ params }, null, 2)}</pre>
    </Layout>
  );
}
