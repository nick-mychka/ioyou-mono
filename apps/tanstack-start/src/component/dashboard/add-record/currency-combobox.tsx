import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@ioyou/ui";
import { Button } from "@ioyou/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@ioyou/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@ioyou/ui/popover";

import { useTRPC } from "~/lib/trpc";

export function CurrencyCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (currencyId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: currencies } = useQuery(trpc.currency.all.queryOptions());

  const createCurrency = useMutation(
    trpc.currency.create.mutationOptions({
      onSuccess: (data) => {
        toast.success("Currency created");
        void queryClient.invalidateQueries({
          queryKey: trpc.currency.all.queryKey(),
        });
        if (data[0]) {
          onChange(data[0].id);
        }
        setSearch("");
        setOpen(false);
      },
      onError: () => {
        toast.error("Failed to create currency");
      },
    }),
  );

  const selectedCurrency = currencies?.find((c) => c.id === value);

  const handleCreateCurrency = () => {
    if (!search.trim()) return;
    createCurrency.mutate({ code: search.trim() });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
          )}
        >
          {selectedCurrency?.code ?? "Select currency"}
          <ChevronsUpDown className="text-muted-foreground size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search currency..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 py-2">
                <p className="text-muted-foreground text-sm">
                  No currency found
                </p>
                {search.trim() && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCreateCurrency}
                    disabled={createCurrency.isPending}
                  >
                    <Plus className="size-3" />
                    Create &quot;{search.trim().toUpperCase()}&quot;
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {currencies?.map((currency) => (
                <CommandItem
                  key={currency.id}
                  value={currency.code}
                  onSelect={() => {
                    onChange(currency.id);
                    setOpen(false);
                  }}
                >
                  {currency.code}
                  <Check
                    className={cn(
                      "ml-auto size-4",
                      value === currency.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
