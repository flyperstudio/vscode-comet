'use strict';
let fs = require("fs");
let path = require('path')
import * as vscode from 'vscode';
import {ProjectType } from './msbuild-project-analyzer';
import { XamarinProjectManager } from './xamarin-project-manager';

interface CometBuildTaskDefinition extends vscode.TaskDefinition {
	/**
	 * Additional build flags
	 */

	task: string;

	command:string;

	csproj:string;

	configuration:string;

	projectType:ProjectType;

	target:string;

	platform:string;

	flags?: string[];
}

export class XamarinBuildTaskProvider implements vscode.TaskProvider {
	static XamarinBuildScriptType: string = 'xamarin';
	private csproj:string;
	private configuration:string;
	private platform:string;

	private tasks: vscode.Task[] | undefined;
	
	// We use a CustomExecution task when state needs to be shared accross runs of the task or when 
	// the task requires use of some VS Code API to run.
	// If you don't need to share state between runs and if you don't need to execute VS Code API in your task, 
	// then a simple ShellExecution or ProcessExecution should be enough.
	// Since our build has this shared state, the CustomExecution is used below.
	private sharedState: string | undefined;

	constructor(private workspaceRoot: string){
		console.log(workspaceRoot);
	}

	public async provideTasks(): Promise<vscode.Task[]> {
		return this.getTasks();
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		return this.getTask(XamarinBuildTaskProvider.msBuildCommand,"Build",[]);
	}

	static msBuildCommand:string = "msbuild";

	private getTasks(): vscode.Task[] {
		
		// if(CometProjectManager.Shared().CurrentCSProj() === this.csproj
		//  && CometProjectManager.CurrentConfig() === this.configuration
		//   && CometProjectManager.CurrentPlatform()=== this.platform  
		//   && this.tasks !== undefined && this.tasks.length > 0)
		//  	return this.tasks;

		
		// this.csproj = CometProjectManager.Shared().CurrentCSProj();
		// if(this.csproj === undefined)
		// {

		// 	vscode.window.showInformationMessage("csproj is not set");
		// 	return undefined;
		// }
		// this.configuration = CometProjectManager.CurrentConfig();
		// this.platform = CometProjectManager.CurrentPlatform();

		// this.tasks = [];
		// var flags = [];
		// var target = "Build";
		// if(CometProjectManager.CurrentProjectType() === ProjectType.Android)
		// {
		// 	// var device = CometProjectManager.Shared().CurrentDevice();
		// 	// if(device === undefined ||device.projectType != ProjectType.Android)
		// 	// {
		// 	// 	vscode.window.showInformationMessage("csproj is not set");
		// 	// 	return undefined;
		// 	// }
		// 	target = "Install";
		// 	// flags.push("/p:AndroidAttachDebugger=true");
		// 	// flags.push(`-p:SelectedDevice=${device.id}`);
		// 	// flags.push(`/p:SelectedDevice=android_api_28`);
			
		// 	//TODO: target install
		// 	//TODO: Target: _run
		// }
		//this.tasks.push(this.getTask(XamarinBuildTaskProvider.msBuildCommand,target,flags));
	
		return this.tasks;
	}

	private getTask(command:string ,target: string, flags: string[], definition?: CometBuildTaskDefinition): vscode.Task{
		var configuration = XamarinProjectManager.SelectedProjectConfiguration;
		var csproj = XamarinProjectManager.SelectedProject.Path;
		var platform = '';
		if (definition === undefined) {
			definition = {
				task: "MSBuild",
				command,
				type: XamarinBuildTaskProvider.XamarinBuildScriptType,
				csproj,
				configuration,
				projectType: null,// CometProjectManager.CurrentProjectType(),
				platform,
				target,
				flags
			};
		}

		var fullCommand = `${command} ${csproj} /t:${target} /p:Configuration=${configuration};Platform=${platform} ${flags.join(' ')}`;
		var task = new vscode.Task(definition, definition.target, 'xamarin', new vscode.ShellExecution(fullCommand));
		return task;
	}
}