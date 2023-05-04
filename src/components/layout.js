import * as React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";

export function Layout({ children }) {
  const data = useStaticQuery(graphql`
    {
      allSiteFunction {
        nodes {
          functionRoute
        }
      }
      allSitePage(
        filter: { path: { regex: "/^(?!/dev-404-page).+$/" } }
        sort: { path: ASC }
      ) {
        nodes {
          path
        }
      }
    }
  `);

  return (
    <>
      <h2>Pages</h2>
      <ul>
        {data.allSitePage.nodes.map((node) => (
          <li key={node.path}>
            <Link to={node.path}>{node.path}</Link>
          </li>
        ))}
      </ul>
      <h2>Functions</h2>
      <ul>
        {data.allSiteFunction.nodes.map((node) => (
          <li key={node.functionRoute}>
            <a href={`/api/${node.functionRoute}`} target="api-window">
              {node.functionRoute}
            </a>
          </li>
        ))}
      </ul>
      <hr />
      <main>{children}</main>
    </>
  );
}
