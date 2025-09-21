import React,{createContext,useContext,useState} from "react";
import { Appearance } from "react-native";

//Criação do contexto
const ThemeContext = createContext()

//Hook customizado para acessar o tema
export function useTheme(){
    return useContext(ThemeContext)
}

//Provider que envolve toda a aplicação
export function ThemeProvider({children}){
    //Detecta o tema atual do dispositivo 
    const colorScheme = Appearance.getColorScheme()

    //Estado para armazenar o tema(dark ou light)
    const[theme,setTheme]=useState(colorScheme||'light')

    //Função para alternar entre os temas
    const toggleTheme = ()=>{
        setTheme((value)=>value==='light'?'dark':'light')
    }

    //Esquema de cores por tema
    const themeColors = {
        light:{
            background:'#fff',
            text:'#000',
            button:'#00f',
            buttonText:'#fff'
        },
        dark:{
            background:'#121212',
            text:'#fff',
            button:'#10f72b',
            buttonText:'#000'
        }
    }
    return(
        <ThemeContext.Provider value={{theme,toggleTheme,colors:themeColors[theme]}}>
            {children}
        </ThemeContext.Provider>
    )
}