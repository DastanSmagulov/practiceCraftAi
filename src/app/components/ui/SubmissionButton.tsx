import React from "react";
import Link from "next/link";

export default function SubmissionButton(
  props: any,
  { variant = "primary", children }: any
) {
  let className =
    `mt-8 px-12 py-3 bg-gradient-to-r from-primary to-primaryDark` +
    " hover:opacity-90 text-xl text-white/90 font-semibold drop-shadow-lg rounded-full";

  return props.href ? (
    <Link className={className} {...props} />
  ) : (
    <button type="button" className={className} {...props} />
  );
}
