






local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ReplicatedFirst   = game:GetService("ReplicatedFirst")
local UserInputService  = game:GetService("UserInputService")
local RunService        = game:GetService("RunService")
local Lighting          = game:GetService("Lighting")
local Players           = game:GetService("Players")

local LocalPlayer = Players.LocalPlayer
local PlayerGui   = LocalPlayer.PlayerGui
local Mouse       = LocalPlayer:GetMouse()
local Camera      = workspace.CurrentCamera
RunService.RenderStepped:Connect(function()
    Camera = workspace.CurrentCamera
end)
local PlayerDrawings = {}
local Utility        = {}

Utility.Settings = {
    Line = {
        Thickness = 1,
        Color = Color3.fromRGB(0, 255, 0)
    },
    Text = {
        Size = 13,
        Center = true,
        Outline = true,
        Font = Drawing.Fonts.Plex,
        Color = Color3.fromRGB(255, 255, 255)
    },
    Square = {
        Thickness = 1,
        Color = Color3.fromRGB(255, 255, 255),
        Filled = false,
    },
    Triangle = {
        Color = Color3.fromRGB(255, 255, 255),
        Filled = true,
        Visible = false,
        Thickness = 1,
    }
}
function Utility.New(Type, Outline, Name)
    local drawing = Drawing.new(Type)
    for i, v in pairs(Utility.Settings[Type]) do
        drawing[i] = v
    end
    if Outline then
        drawing.Color = Color3.new(0,0,0)
        drawing.Thickness = 3
    end
    return drawing
end
function Utility.Add(Player)
    if not PlayerDrawings[Player] then
        PlayerDrawings[Player] = {
            Offscreen = Utility.New("Triangle", nil, "Offscreen"),
            Name = Utility.New("Text", nil, "Name"),
            Tool = Utility.New("Text", nil, "Tool"),
            Distance = Utility.New("Text", nil, "Distance"),
            BoxOutline = Utility.New("Square", true, "BoxOutline"),
            Box = Utility.New("Square", nil, "Box"),
            HealthOutline = Utility.New("Line", true, "HealthOutline"),
            Health = Utility.New("Line", nil, "Health")
        }
    end
end

for _,Player in pairs(Players:GetPlayers()) do
    if Player ~= LocalPlayer then
        Utility.Add(Player)
    end
end
Players.PlayerAdded:Connect(Utility.Add)
Players.PlayerRemoving:Connect(function(Player)
    if PlayerDrawings[Player] then
        for i,v in pairs(PlayerDrawings[Player]) do
            if v then
                v:Remove()
            end
        end

        PlayerDrawings[Player] = nil
    end
end)

local ESPLoop = game:GetService("RunService").RenderStepped:Connect(function()
    for _,Player in pairs (Players:GetPlayers()) do
        local PlayerDrawing = PlayerDrawings[Player]
        if not PlayerDrawing then continue end

        for _,Drawing in pairs (PlayerDrawing) do
            Drawing.Visible = false
        end

        if not game.Players.LocalPlayer.Name or not game.Players.LocalPlayer.Name then continue end

        local Character = Player.Character
        local RootPart, Humanoid = Character and Character:FindFirstChild("HumanoidRootPart"), Character and Character:FindFirstChildOfClass("Humanoid")
        if not Character or not RootPart or not Humanoid then continue end

        local DistanceFromCharacter = (Camera.CFrame.Position - RootPart.Position).Magnitude
        if 1000 < DistanceFromCharacter then continue end

        local Pos, OnScreen = Camera:WorldToViewportPoint(RootPart.Position)
        if not OnScreen then
            local VisualTable = Player.Team ~= LocalPlayer.Team
            if Player.Team ~= LocalPlayer.Team  then continue end
            if Player.Team == LocalPlayer.Team  then continue end

            local RootPos = RootPart.Position
            local CameraVector = Camera.CFrame.Position
            local LookVector = Camera.CFrame.LookVector

            local Dot = LookVector:Dot(RootPart.Position - Camera.CFrame.Position)
            if Dot <= 0 then
                RootPos = (CameraVector + ((RootPos - CameraVector) - ((LookVector * Dot) * 1.01)))
            end
        else
            local VisualTable = Player.Team ~= LocalPlayer.Team

            local Size           = (Camera:WorldToViewportPoint(RootPart.Position - Vector3.new(0, 3, 0)).Y - Camera:WorldToViewportPoint(RootPart.Position + Vector3.new(0, 2.6, 0)).Y) / 2
            local BoxSize        = Vector2.new(math.floor(Size * 1.5), math.floor(Size * 1.9))
            local BoxPos         = Vector2.new(math.floor(Pos.X - Size * 1.5 / 2), math.floor(Pos.Y - Size * 1.6 / 2))

            local Name           = PlayerDrawing.Name
            local Tool           = PlayerDrawing.Tool
            local Distance       = PlayerDrawing.Distance
            local Box            = PlayerDrawing.Box
            local BoxOutline     = PlayerDrawing.BoxOutline
            local Health         = PlayerDrawing.Health
            local HealthOutline  = PlayerDrawing.HealthOutline

            if VisualTable  then
                Box.Size = BoxSize
                Box.Position = BoxPos
                Box.Visible = getgenv().Config.Visual.Box
                Box.Color = getgenv().Config.Visual.BoxColor
                BoxOutline.Size = BoxSize
                BoxOutline.Position = BoxPos
                BoxOutline.Visible = getgenv().Config.Visual.BoxOutline
            end

            if VisualTable  then
                Health.From = Vector2.new((BoxPos.X - 5), BoxPos.Y + BoxSize.Y)
                Health.To = Vector2.new(Health.From.X, Health.From.Y - (Humanoid.Health / Humanoid.MaxHealth) * BoxSize.Y)
                Health.Color = getgenv().Config.Visual.HealthColor
                Health.Visible = getgenv().Config.Visual.Health

                HealthOutline.From = Vector2.new(Health.From.X, BoxPos.Y + BoxSize.Y + 1)
                HealthOutline.To = Vector2.new(Health.From.X, (Health.From.Y - 1 * BoxSize.Y) -1)
                HealthOutline.Visible = getgenv().Config.Visual.HealthOutline

                if VisualTable  then
                    Name.Text = (Player.Name)
                    Name.Position = Vector2.new(BoxSize.X / 2 + BoxPos.X, BoxPos.Y - 16)
                    Name.Color = getgenv().Config.Visual.NameColor
                    Name.Font = Drawing.Fonts.Plex
                    Name.Visible = getgenv().Config.Visual.Name
                end

            end
        end
    end
end)
