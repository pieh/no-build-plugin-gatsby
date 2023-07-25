import * as React from "react";

export default function TestSlice({ setting }) {
  return (
    <>
      Hello Slice!
      <pre>{JSON.stringify({ setting }, null, 2)}</pre>
    </>
  );
}
