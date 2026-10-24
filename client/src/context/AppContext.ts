import { createContext } from "react";
import type { AppContextType } from "../types";

const AppContext = createContext<AppContextType | undefined>(undefined);

export default AppContext;
