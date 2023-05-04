import * as React from "react";
import { Layout } from "../components/layout";

export default function SSR({ serverData }) {
  return (
    <Layout>
      Hello SSR!<pre>{JSON.stringify(serverData, null, 2)}</pre>
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
