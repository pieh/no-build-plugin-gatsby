import * as React from "react";
import { Layout } from "../../components/layout";
import { graphql } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

export default function SSG({ data, params }) {
  return (
    <Layout>
      Hello Images!
      <h2>Image CDN (gatsbyImage)</h2>
      <ul>
        {data.allUnsplashImage.nodes.map((node, index) => (
          <>
            <li key={node.id + `-gatsby-image`}>
              <GatsbyImage image={getImage(node)} />
            </li>
            <li key={node.id + `-original`}>
              <img src={node.publicUrl} />
            </li>
          </>
        ))}
      </ul>
      <h2>Old one (gatsbyImageData)</h2>
      <ul>
        {data.allImageSharp.nodes.map((node, index) => (
          <>
            <li key={node.id + `-gatsby-image`}>
              <GatsbyImage image={getImage(node)} />
            </li>
            <li key={node.id + `-original`}>
              <img src={node.original.src} />
            </li>
          </>
        ))}
      </ul>
    </Layout>
  );
}

export const q = graphql`
  {
    allUnsplashImage {
      nodes {
        id
        gatsbyImage(width: 200)
        publicUrl
      }
    }
    allImageSharp {
      nodes {
        id
        gatsbyImageData(width: 200)
        original {
          src
        }
      }
    }
  }
`;
