import { json} from "@remix-run/node";
import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

import center from '@turf/center';
import { z } from "zod";

import type { ColumnDef } from "@tanstack/react-table"

import { ClientOnly } from "~/components/client-only";
import { Map } from "~/components/map.client";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DataTable } from "~/components/data-table";

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
  

  const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
  type Literal = z.infer<typeof literalSchema>;
  type Json = Literal | { [key: string]: Json } | Json[];
  const jsonSchema: z.ZodType<Json> = z.lazy(() =>
    z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)])
  );

  console.log(jsonSchema.parse(features.features[0].properties));
  console.log(typeof features.features[0].properties.LFDNR);
  for (let [key, value] of Object.entries(features.features[0].properties)) {
    console.log(key, typeof value);
  }

  const featureCenter = center(features);

  return json({
    payload,
    features,
    center: featureCenter,
  });
};

export default function Index() {
  const mapHeight = "800px";
  const result = useActionData<typeof action>();

  console.log(result);
  // const properties = jsonToZod(result?.features.features[0].properties);
  // console.log(properties);
  
  const test = z.object({});
  let columns: ColumnDef<any>[] = [];
  // type JSONProperties =  z.infer<typeof test>;


  let data = [];
  if (result && result.features && result.features.features) {
    for (let [key, value] of Object.entries(result?.features.features[0].properties)) {
      console.log(key, typeof value);
      test.extend({
        [`${key}`]: typeof value === "string" ? z.string() : typeof value === "number" ? z.number() : z.null()
      })
      columns.push({
        accessorKey: key,
        header: key
      })
    }
    result?.features?.features?.map((entry: any) => data.push(entry.properties));
  }
  console.log("data:" ,data)

  
  
  return (
    <div className="flex flex-col w-full overflow-hidden">
      <Form method="post" className="px-2 py-2">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input type="url" placeholder="url" name="url" defaultValue={result?.payload.url} />
          <Button type="submit">Load data</Button>
          <div>{result?.error?.url}</div>
        </div>
      </Form>
      <div className="flex gap-3 overflow-hidden">
        <ClientOnly
          fallback={
            <div
              id="skeleton"
              style={{ height: mapHeight, width: '100%', background: "#d1d1d1" }}
            />
          }
        >
          {() => <div className="w-1/2"><Map height={mapHeight} data={result?.features} center={result?.center} /></div>}
        </ClientOnly>
        <div className="w-1/2 min-h-[350px] overflow-auto">
          {columns && data ? <DataTable columns={columns} data={data} /> : null}
        </div>
      </div>
    </div>
  );
}