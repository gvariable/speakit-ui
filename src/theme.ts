import {createTheme, Theme} from "@mui/material";

export function getTheme(fontSize : number): Theme {
    return createTheme({
        palette: {
            primary: {
                main: "#EBF1FA",
                light: "#006398",
                dark: "#93CCFF"
            },
            secondary: {
                main: "#EDDCFF",
                light: "#67587A",
                dark: "#D2BFE7"
            },
            text: {
                primary: "#000000",
                secondary: "#AAAAAA"
            },
            background: {
                default: "#FCFCFF"
            }
        },
        typography: {
            fontSize
        }
    })
}
