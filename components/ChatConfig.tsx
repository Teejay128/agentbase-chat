"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, PlusIcon, CodeIcon, Zap, Gauge, Brain } from "lucide-react"; // Using CodeIcon for system prompt visual
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PopoverContent } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea"; // Using Textarea for System Prompt

type AgentMode = "flash" | "fast" | "max";
type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>;

// --- Types ---
interface ChatConfigProps {
	agentMode: AgentMode;
	setAgentMode: SetStateAction<AgentMode>;
	agentSystem: string;
	setAgentSystem: SetStateAction<string>;
	agentRules: string[];
	setAgentRules: SetStateAction<string[]>;
}

export function ChatConfig({
	agentMode,
	setAgentMode,
	agentSystem,
	setAgentSystem,
	agentRules,
	setAgentRules,
}: ChatConfigProps) {
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
		<PopoverContent className="w-80 p-3 text-xs space-y-3">
			<div className="space-y-2">
				<p className="text-muted-foreground font-semibold tracking-wide">
					Agent Configuration
				</p>
				<hr className="border-gray-200/40" />
			</div>

			<div className="grid gap-4">
				<div className="grid grid-cols-3 items-center gap-0">
					<Label
						htmlFor="mode"
						className="text-muted-foreground text-xs"
					>
						Mode
					</Label>
					<Select
						value={agentMode}
						onValueChange={(value) =>
							setAgentMode(value as AgentMode)
						}
					>
						<SelectTrigger className="h-6 not-first:w-50 text-xs">
							<SelectValue placeholder="Select agent mode" />
						</SelectTrigger>
						<SelectContent className="w-50 text-xs">
							<SelectItem
								value="flash"
								className="flex items-center text-xs"
							>
								<Zap size={12} />
								<span className="font-medium">Flash:</span>
								<span className="text-muted-foreground">
									Quick Tasks
								</span>
							</SelectItem>
							<SelectItem
								value="fast"
								className="flex items-center text-xs"
							>
								<Gauge size={12} />
								<span className="font-medium">Fast:</span>
								<span className="text-muted-foreground">
									Smart Work
								</span>
							</SelectItem>
							<SelectItem
								value="max"
								className="flex items-center text-xs"
							>
								<Brain size={12} />
								<span className="font-medium">Max:</span>
								<span className="text-muted-foreground">
									Deep Thinking
								</span>
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				<div className="grid gap-1.5">
					<Label
						htmlFor="system"
						className="flex items-center gap-1 text-xs text-muted-foreground"
					>
						<CodeIcon className="w-3 h-3" />
						System Prompt
					</Label>
					<Textarea
						id="system"
						rows={3}
						value={agentSystem}
						onChange={(e) => setAgentSystem(e.target.value)}
						placeholder="Define the agent's persona and core instructions..."
						className="col-span-3 text-xs resize-none"
					/>
				</div>

				<div className="grid gap-1.5">
					<Label className="text-xs text-muted-foreground">
						Agent Rules ({agentRules.length})
					</Label>

					<div className="flex gap-1.5">
						<Input
							value={newRuleInput}
							onChange={(e) => setNewRuleInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && addRule()}
							placeholder="Enter new rule (e.g., 'Use Tailwind CSS')"
							className="flex-grow h-7 text-xs"
						/>
						<Button
							size="sm"
							onClick={addRule}
							disabled={!newRuleInput.trim()}
						>
							<PlusIcon className="w-3.5 h-5" />
						</Button>
					</div>

					<div className="flex flex-wrap gap-1 pt-1 min-h-[25px]">
						{agentRules.map((rule, index) => (
							<Badge
								key={index}
								variant="secondary"
								className="flex items-center gap-1 pr-1 h-5 text-[11px] cursor-default"
							>
								<span className="max-w-[160px] truncate">
									{rule}
								</span>
								<button
									type="button"
									onClick={() => removeRule(index)}
									className="rounded-full hover:bg-red-500/10 p-0.5 transition-colors"
								>
									<X className="w-2.5 h-2.5 text-muted-foreground hover:text-red-500" />
								</button>
							</Badge>
						))}
						{agentRules.length === 0 && (
							<p className="text-[11px] text-gray-400">
								No specific rules defined.
							</p>
						)}
					</div>
				</div>
			</div>
		</PopoverContent>
	);
}
