import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionFunctionArgs} from "@remix-run/node";
import { json, type LinksFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import center from '@turf/center';
import { z } from "zod";

import { ClientOnly } from "~/components/client-only";
import { Map } from "~/components/map.client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const schema = z.object({
  url: z.string({ required_error: 'URL is required' }).url()
});

export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: "https://unpkg.com/leaflet@1.8.0/dist/leaflet.css",
  },
];


export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();

  // Parse the form data

  const payload = Object.fromEntries(formData);
  const result = schema.safeParse(payload);

  if (!result.success) {
    return json({
      payload,
      features: null,
      center: null,
      error: result.error.flatten().fieldErrors,
    });
  }

  const data = await fetch(result.data.url);
  const features = await data.json();

  const featureCenter = center(features);

  return json({
    payload,
    features,
    center: featureCenter
  });
};

export default function Index() {
  const mapHeight = "800px";
  const result = useActionData<typeof action>();
  
  return (
    <div className="w-full h-full">
      <Form method="post" className="px-2 py-2">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="url" placeholder="url" name="url" defaultValue={result?.payload.url} />
          <Button type="submit">Load data</Button>
          <div>{result?.error?.url}</div>
        </div>
      </Form>
      <ClientOnly
        fallback={
          <div
            id="skeleton"
            style={{ height: mapHeight, background: "#d1d1d1" }}
          />
        }
      >
        {() => <Map height={mapHeight} data={result?.features} center={result?.center} />}
      </ClientOnly>
    </div>
  );
}