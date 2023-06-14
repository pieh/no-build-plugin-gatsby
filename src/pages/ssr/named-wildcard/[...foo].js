import * as React from "react";
import { graphql } from "gatsby";
import { Layout } from "../../../components/layout";

export default function SSR({ serverData, params, data }) {
  return (
    <Layout>
      Hello SSR!
      <pre>{JSON.stringify({ params, serverData, data }, null, 2)}</pre>
    </Layout>
  );
}

export function getServerData({ params }) {
  return {
    props: {
      ssr: true,
      params,
    },
    headers: {
      "x-ssr-header-overwrite": "my custom header value from getServerData",
      "x-ssr-header-serverdata": "test",
    },
  };
}

export const q = graphql`
  {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`;
