import * as React from "react";

export default function TestSliceAlternative({ setting }) {
  return (
    <>
      Hello Slice Alternative!
      <pre>{JSON.stringify({ setting }, null, 2)}</pre>
    </>
  );
}
