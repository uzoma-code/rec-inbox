import { AddRecForm } from "@/components/add-rec-form";

export default function AddRecPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-medium tracking-tight text-foreground">Add a rec</h1>
        <p className="mt-2 text-muted-foreground">
          Title, who told you, movie or show.
        </p>
      </div>
      <AddRecForm />
    </div>
  );
}
