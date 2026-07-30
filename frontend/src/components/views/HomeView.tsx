export default function HomeView() {
	return (
		<div className="flex flex-col items-center justify-center h-full space-y-4 p-8 text-center">
			<h1 className="text-4xl font-bold text-primary">
				Welcome to the Multiverse
			</h1>
			<p className="text-lg text-muted-foreground max-w-xl">
				Select a Jump Document, forge your Origins, acquire Perks, and build
				your perfect chain. Use the sidebar to explore available worlds.
			</p>
		</div>
	);
}
