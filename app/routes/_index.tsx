import { useForm } from "@conform-to/react";
import { parse } from "@conform-to/zod";
import type { ActionFunctionArgs} from "@remix-run/node";
import { json, type LinksFunction } from "@remix-run/node";
import { Form, useActionData, useLoaderData } from "@remix-run/react";

import center from '@turf/center';
import { z } from "zod";

import { ClientOnly } from "~/components/client-only";
import { Map } from "~/components/map.client";

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

  console.log(result.data.url);
  const data = await fetch(result.data.url);
  const features = await data.json();
  console.log(features)

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
  console.log(result);
  
  return (
    <>
      <Form method="post">
        <div>
          <label>Url</label>
          <input type="url" name="url" defaultValue={result?.payload.url} />
          <div>{result?.error?.url}</div>
        </div>
        <button>Send</button>
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
    </>
  );
}