import { Home, BookOpen, Users } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../ui/sidebar";

export function AppSidebar({
	currentView,
	setView,
}: {
	currentView: string;
	setView: (v: string) => void;
}) {
	const navItems = [
		{ id: "home", label: "Home", icon: Home },
		{ id: "jumpers", label: "Jumpers", icon: Users },
		{ id: "documents", label: "Jump Docs", icon: BookOpen },
	];

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader className="p-4 font-bold text-lg text-primary tracking-tight flex items-center h-16">
				<span className="group-data-[collapsible=icon]:hidden">JumpChain</span>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.id}>
									<SidebarMenuButton
										isActive={currentView === item.id}
										onClick={() => setView(item.id)}
										tooltip={item.label}
									>
										<item.icon />
										<span>{item.label}</span>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
