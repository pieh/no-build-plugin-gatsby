import * as React from "react";
import { Layout } from "../../../components/layout";

export default function SSR({ serverData, params }) {
  return (
    <Layout>
      Hello SSR!<pre>{JSON.stringify({ params, serverData }, null, 2)}</pre>
    </Layout>
  );
}

export function getServerData() {
  return {
    props: {
      ssr: true,
    },
  };
}
