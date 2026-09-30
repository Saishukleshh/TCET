import { redirect } from "next/navigation";

/** Root → redirect to command dashboard */
export default function Home() {
  redirect("/command");
}
