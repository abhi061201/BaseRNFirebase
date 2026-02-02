import { useFCM, useNotifications } from "@/hooks";
import { useCounterStore } from "@/store";

const useHomeScreen = () => {
    useFCM();
    useNotifications();

    const { count, setCount, reset , increment, decrement} = useCounterStore();
    return {
        count,
        setCount,
        reset,
        increment, 
        decrement
    }
}

export default useHomeScreen

