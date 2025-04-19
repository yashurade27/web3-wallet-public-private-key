import { Separator } from "@/components/ui/separator";
export default function Footer() {
  return (
    <section>
      <div className="px-32 mt-50">
        <Separator />
        <div className="tracking-tighter flex flex-row justify-baseline py-4 text-sm text-gray-500 dark:text-gray-400">
          Designed and developed by&nbsp;
          <a 
            href="https://www.linkedin.com/in/yash-urade-561b26186/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Yash.
          </a>
        </div>
      </div>
    </section>
  );
}
