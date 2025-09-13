import { supabase } from "@/lib/supabaseClient";

export default async function TestPage() {
  const { data, error } = await supabase.from("categories").select("*");

  if (error) {
    return <div className="p-6 text-red-600">Error: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Categories from Supabase</h1>
      <ul className="list-disc pl-6 mt-4">
        {data?.map((cat: any) => (
          <li key={cat.category_id}>{cat.name}</li>
        ))}
      </ul>
    </div>
  );
}
