import * as React from "react";
import { Layout } from "../../../components/layout";
import { Slice } from "gatsby";

export default function SSG({ params, pageContext }) {
  return (
    <Layout>
      Hello SSG!
      <pre>{JSON.stringify({ params }, null, 2)}</pre>
      <Slice alias="test" setting={pageContext?.setting ?? `default`} />
    </Layout>
  );
}
