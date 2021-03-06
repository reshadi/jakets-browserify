import * as Path from "path";
import * as Browserify from "browserify";

import * as Jakets from "jakets/lib/Jakets";

import * as Util from "jakets/lib/Util";
import { CommandInfo, ExtractFilesAndUpdateDependencyInfo } from "jakets/lib/Command";

let RawExec = Util.CreateNodeExec(
  "browserify",
  "browserify --help",
  "browserify/bin/cmd.js"
);

let Tsify = "tsify";
Tsify = Util.FindModulePath(Tsify) || Tsify;

let Collapser = "bundle-collapser/plugin.js";
Collapser = Util.FindModulePath(Collapser) || Collapser;

export function Exec(inputs: string, output: string, callback, isRelease?: boolean, tsargs?: string, options?: string, isSilent?: boolean) {
  let args = inputs;
  if (tsargs !== null) {
    args += " -p [ " + Tsify + " --global " + (tsargs || "") + " ]";
  }
  if (isRelease) {
    args += "  -p [ " + Collapser + " ]";
  } else {
    args += " --debug";
  }
  args += " --outfile " + output;
  if (options) {
    args += " " + options;
  }

  jake.mkdirP(Path.dirname(output));

  RawExec(args, callback, isSilent);
}

export function BrowserifyTask(
  name: string
  , dependencies: string[]
  , output: string
  , inputs: string
  , isRelease?: boolean
  , tsargs?: string
  , options?: string
): string {
  let depInfo = new CommandInfo({
    Name: name,
    Dir: Path.resolve(Util.LocalDir),
    Command: "browserify",
    Inputs: [inputs],
    Outputs: [output],
    IsRelease: isRelease,
    Tsargs: tsargs,
    Options: options,
    Dependencies: dependencies
  });

  file(depInfo.DependencyFile, depInfo.AllDependencies, function () {
    Exec(
      inputs
      , output
      , (error, stdout: string, stderror) => {
        ExtractFilesAndUpdateDependencyInfo(depInfo, error, stdout, stderror);
        this.complete();
        Jakets.Log("list done", 2);
      }
      , isRelease
      , tsargs
      , (options || "") + " --list"
      , true
    );
  }, { async: true });

  file(output, [depInfo.DependencyFile], function () {
    Exec(
      inputs
      , output
      , () => {
        this.complete();
        Jakets.Log("done", 2);
      }
      , isRelease
      , tsargs
      , options
    );
  }, { async: true });

  return output;
}