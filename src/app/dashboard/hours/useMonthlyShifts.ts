// app/dashboard/hours/useMonthlyShifts.ts
import useSWR from "swr";
import { startOfMonth, endOfMonth, format } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useMonthlyShifts(currentDay: Date) {
  const monthStart = startOfMonth(currentDay);
  const monthEnd = endOfMonth(currentDay);
  const startStr = format(monthStart, "yyyy-MM-dd");
  const endStr = format(monthEnd, "yyyy-MM-dd");

  const { data: realData, error: realError, mutate: mutateReal } = useSWR(
    `/api/time-records?start=${startStr}&end=${endStr}`,
    fetcher,
    { revalidateOnFocus: false }
  );
  const { data: plannedData, error: plannedError, mutate: mutatePlanned } = useSWR(
    `/api/planning/planned?start=${startStr}&end=${endStr}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    realShifts: realData?.realShifts || [],
    plannedShifts: plannedData?.plannedShifts || [],
    isLoading: (!realData && !realError) || (!plannedData && !plannedError),
    isError: realError || plannedError,
    mutateReal,
    mutatePlanned,
  };
}
