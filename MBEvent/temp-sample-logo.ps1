Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("assets/images/startup-logo.jpg")
$bmp = New-Object System.Drawing.Bitmap($img)
$points = @( [System.Drawing.Point]::new(20,20), [System.Drawing.Point]::new([int]($bmp.Width/2), [int]($bmp.Height/2)), [System.Drawing.Point]::new([int]($bmp.Width/4), [int]($bmp.Height/4)), [System.Drawing.Point]::new([int](3*$bmp.Width/4), [int]($bmp.Height/4)) )
foreach ($pt in $points) {
  $c = $bmp.GetPixel($pt.X, $pt.Y)
  Write-Host "$($pt.X),$($pt.Y): $($c.R),$($c.G),$($c.B)"
}
