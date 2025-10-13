"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, PlusIcon, CodeIcon } from "lucide-react"; // Using CodeIcon for system prompt visual
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for System Prompt

type AgentMode = "flash" | "fast" | "max";
type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

// --- Types ---
interface AgentConfigProps {
	agentMode: AgentMode;
	setAgentMode: SetStateAction<AgentMode>;
	agentSystem: string;
	setAgentSystem: SetStateAction<string>;
	agentRules: string[];
	setAgentRules: SetStateAction<string[]>;
}

export function AgentConfig({
	agentMode,
	setAgentMode,
	agentSystem,
	setAgentSystem,
	agentRules,
	setAgentRules,
}: AgentConfigProps) {
	const [newRuleInput, setNewRuleInput] = useState("");

	const addRule = () => {
		const trimmed = newRuleInput.trim();
		if (trimmed) {
			setAgentRules((prev) => [...prev, trimmed]);
			setNewRuleInput("");
		}
	};

	const removeRule = (ruleIndex: number) => {
		setAgentRules((prev) => prev.filter((_, index) => index !== ruleIndex));
	};

	return (
		<div className="grid gap-4">
			<div className="space-y-2">
				<p className="text-muted-foreground text-sm font-medium">
					Agent Configuration
				</p>
			</div>

			<div className="grid gap-4">
				{/* === 1. Mode (Enum Select) === */}
				<div className="grid grid-cols-3 items-center gap-4">
					<Label htmlFor="mode">Mode</Label>
					<Select
						value={agentMode}
						onValueChange={(value) =>
							setAgentMode(value as AgentMode)
						}
					>
						<SelectTrigger id="mode" className="col-span-2 h-8">
							<SelectValue placeholder="Select a mode" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="flash">Flash (Speed)</SelectItem>
							<SelectItem value="fast">Fast (Balance)</SelectItem>
							<SelectItem value="max">Max (Quality)</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* === 2. System (String Input/Textarea) === */}
				<div className="grid gap-2">
					<Label htmlFor="system" className="flex items-center gap-1">
						<CodeIcon className="w-3 h-3 text-muted-foreground" />
						System Prompt
					</Label>
					<Textarea
						id="system"
						rows={4}
						value={agentSystem}
						onChange={(e) => setAgentSystem(e.target.value)}
						placeholder="Define the agent's persona and core instructions..."
						className="col-span-3"
					/>
				</div>

				{/* === 3. Rules (Dynamic Array Input) === */}
				<div className="grid gap-2">
					<Label>Agent Rules ({agentRules.length})</Label>

					{/* Rules Input and Add Button */}
					<div className="flex gap-2">
						<Input
							value={newRuleInput}
							onChange={(e) => setNewRuleInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									addRule();
								}
							}}
							placeholder="Enter new rule (e.g., 'Use Tailwind CSS')"
							className="flex-grow"
						/>
						<Button
							size="icon"
							onClick={addRule}
							disabled={!newRuleInput.trim()}
						>
							<PlusIcon className="w-4 h-4" />
						</Button>
					</div>

					{/* Rules Display (Badges) */}
					<div className="flex flex-wrap gap-2 pt-2 min-h-[30px]">
						{agentRules.map((rule, index) => (
							<Badge
								key={index}
								variant="secondary"
								className="flex items-center gap-1.5 pr-1 cursor-default"
							>
								<span className="max-w-[200px] truncate">
									{rule}
								</span>
								<button
									type="button"
									onClick={() => removeRule(index)}
									className="rounded-full hover:bg-red-500/10 p-0.5 transition-colors"
								>
									<X className="w-3 h-3 text-muted-foreground hover:text-red-500" />
								</button>
							</Badge>
						))}
						{agentRules.length === 0 && (
							<p className="text-sm text-gray-400">
								No specific rules defined.
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
