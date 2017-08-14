import "jakets/Jakefile";
import * as Jakets from "jakets/lib/Jakets";
import * as Tsc from "jakets/lib/TscTask";

import { BrowserifyTask } from "./lib/Browserify";
let MakeRelative = Jakets.CreateMakeRelative(__dirname);

Jakets.GlobalTask(
    "test"
    , [
        BrowserifyTask(
            "browserify"
            , [
                Tsc.TscTask(
                    "tsc"
                    , [MakeRelative("./tests/Main.ts")]
                    , []
                    , {
                        outDir: "build/compile",
                        module: Tsc.ModuleKind.CommonJS,
                        target: Tsc.ScriptTarget.ES5
                    }
                ).GetName()
            ]
            , Jakets.BuildDir + "/compile/all.js"
            , Jakets.BuildDir + "/compile/Main.js"
        )
    ]
    , async () => {
        require("./" + Jakets.BuildDir + "/compile/all");
    }
);