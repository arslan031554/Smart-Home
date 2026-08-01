param(
    [Parameter(Mandatory = $true)]
    [string] $DeckPath,
    [string] $OutputPath = "src/presentation/data/greenElectricDeck.json"
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

$technology = @(
    @{ slide = 5; slug = "lighting"; label = "Lighting" },
    @{ slide = 6; slug = "shading"; label = "Shading" },
    @{ slide = 7; slug = "climate-control"; label = "Climate Control" },
    @{ slide = 8; slug = "ventilation"; label = "Ventilation" },
    @{ slide = 9; slug = "multi-room-audio"; label = "Multi-room Audio" },
    @{ slide = 10; slug = "scenes"; label = "Scenes" },
    @{ slide = 11; slug = "metering-cost-distribution"; label = "Metering & Cost Distribution" },
    @{ slide = 12; slug = "access-control"; label = "Access Control" },
    @{ slide = 13; slug = "energy-management"; label = "Energy Management" },
    @{ slide = 14; slug = "control-mobility"; label = "Control & Mobility" },
    @{ slide = 15; slug = "home-cinema"; label = "Home Cinema" },
    @{ slide = 16; slug = "irrigation"; label = "Irrigation" },
    @{ slide = 17; slug = "security"; label = "Security" }
)

$buildings = @(
    @{ slide = 19; slug = "home"; label = "Home" },
    @{ slide = 20; slug = "apartments"; label = "Apartments" },
    @{ slide = 21; slug = "condominiums"; label = "Condominiums" },
    @{ slide = 22; slug = "real-estate-developments"; label = "Real Estate Developments" },
    @{ slide = 23; slug = "offices"; label = "Offices" },
    @{ slide = 24; slug = "hotels"; label = "Hotels" },
    @{ slide = 25; slug = "restaurants-bars"; label = "Restaurants & Bars" },
    @{ slide = 26; slug = "event-spaces"; label = "Event Spaces" },
    @{ slide = 27; slug = "schools"; label = "Schools" },
    @{ slide = 28; slug = "hospitals"; label = "Hospitals" },
    @{ slide = 29; slug = "factories"; label = "Factories" },
    @{ slide = 30; slug = "warehouses"; label = "Warehouses" },
    @{ slide = 31; slug = "parking"; label = "Parking" },
    @{ slide = 32; slug = "outdoor-parks"; label = "Outdoor Parks" },
    @{ slide = 33; slug = "stadiums"; label = "Stadiums" }
)

$solutions = @(
    @{ slide = 35; slug = "design"; label = "Design" },
    @{ slide = 36; slug = "implementation"; label = "Implementation" },
    @{ slide = 37; slug = "maintenance"; label = "Maintenance" }
)

function Get-PartXml {
    param($Zip, [string] $Name)
    $entry = $Zip.GetEntry($Name)
    if (-not $entry) { return $null }
    $reader = [System.IO.StreamReader]::new($entry.Open())
    try {
        return [xml] $reader.ReadToEnd()
    } finally {
        $reader.Dispose()
    }
}

function Get-TextRuns {
    param($Xml)
    if (-not $Xml) { return @() }
    return @($Xml.SelectNodes('//*[local-name()="t"]') | ForEach-Object { $_.InnerText })
}

function Get-NoteParagraphs {
    param($Xml)
    if (-not $Xml) { return @() }
    return @(
        $Xml.SelectNodes('//*[local-name()="p"]') |
            ForEach-Object {
                $text = (@($_.SelectNodes('.//*[local-name()="t"]') | ForEach-Object { $_.InnerText }) -join '').Trim()
                if ($text) { $text }
            }
    )
}

function Get-NoteData {
    param([string[]] $Paragraphs)
    $full = ($Paragraphs -join "`n`n").Trim()
    $metaTitle = ""
    $metaDescription = ""
    if ($full -match '(?s)Meta title:\s*(.*?)\s*Meta description:\s*(.*?)(?:\r?\n\r?\n|FULL WEBSITE PAGE COPY)') {
        $metaTitle = $Matches[1].Trim()
        $metaDescription = $Matches[2].Trim()
    }
    $copyStart = [Array]::FindIndex($Paragraphs, [Predicate[string]] { param($item) $item -like 'FULL WEBSITE PAGE COPY*' })
    $copy = if ($copyStart -ge 0) { @($Paragraphs[($copyStart + 1)..($Paragraphs.Count - 1)]) } else { @() }
    return @{
        seoTitle = $metaTitle
        seoDescription = $metaDescription
        longForm = $copy
    }
}

function Get-StandardPage {
    param($Zip, $Definition, [string] $Section)
    $slide = Get-PartXml $Zip "ppt/slides/slide$($Definition.slide).xml"
    $notes = Get-PartXml $Zip "ppt/notesSlides/notesSlide$($Definition.slide).xml"
    $text = Get-TextRuns $slide
    $noteData = Get-NoteData (Get-NoteParagraphs $notes)
    $features = @()
    for ($index = 23; $index -le 38; $index += 3) {
        $features += @{
            icon = $text[$index]
            title = $text[$index + 1]
            description = $text[$index + 2]
        }
    }
    $tail = @($text[41..($text.Count - 3)] | Where-Object { $_.Trim() -and $_.Trim() -ne "Configure now." })
    return @{
        section = $Section
        slug = $Definition.slug
        route = "/$Section/$($Definition.slug)"
        menuLabel = $Definition.label
        title = $text[13]
        supportingHeadline = $text[14]
        heroDescription = $text[15]
        primaryCta = $text[16]
        secondaryCta = $text[17]
        imageDirection = (@($text[19], $text[20]) | Where-Object { $_.Trim() }) -join " - "
        eyebrow = $text[21]
        sectionHeading = $text[22]
        features = $features
        resultLine = (($tail -join " ") -replace '\s+', ' ').Trim()
        closingDescription = $text[$text.Count - 2]
        closingCta = $text[$text.Count - 1]
        seoTitle = $noteData.seoTitle
        seoDescription = $noteData.seoDescription
        longForm = $noteData.longForm
    }
}

$zip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $DeckPath))
try {
    $homeText = Get-TextRuns (Get-PartXml $zip "ppt/slides/slide3.xml")
    $homeNotes = Get-NoteData (Get-NoteParagraphs (Get-PartXml $zip "ppt/notesSlides/notesSlide3.xml"))
    $homeFeatures = @()
    for ($index = 31; $index -le 46; $index += 3) {
        $homeFeatures += @{
            icon = $homeText[$index]
            title = $homeText[$index + 1]
            description = $homeText[$index + 2]
        }
    }

    $portfolioText = Get-TextRuns (Get-PartXml $zip "ppt/slides/slide39.xml")
    $portfolioNotes = Get-NoteData (Get-NoteParagraphs (Get-PartXml $zip "ppt/notesSlides/notesSlide39.xml"))
    $projects = @()
    for ($index = 23; $index -le 48; $index += 5) {
        $projects += @{
            type = $portfolioText[$index + 2]
            title = $portfolioText[$index + 1]
            location = $portfolioText[$index + 3]
            result = $portfolioText[$index + 4]
        }
    }

    $result = [ordered]@{
        home = @{
            titleLines = @($homeText[13], $homeText[14], $homeText[15])
            heroDescription = $homeText[16]
            primaryCta = $homeText[17]
            secondaryCta = $homeText[18]
            imageDirection = $homeText[20]
            stats = @(
                @{ value = $homeText[21]; label = $homeText[22] },
                @{ value = $homeText[23]; label = $homeText[24] },
                @{ value = $homeText[25]; label = $homeText[26] },
                @{ value = $homeText[27]; label = $homeText[28] }
            )
            sectionHeading = $homeText[29]
            sectionDescription = $homeText[30]
            features = $homeFeatures
            buildingsHeading = $homeText[49]
            buildingLinks = @($homeText[50..56])
            closingTitle = $homeText[57]
            closingDescription = $homeText[58]
            closingCta = $homeText[59]
            seoTitle = $homeNotes.seoTitle
            seoDescription = $homeNotes.seoDescription
            longForm = $homeNotes.longForm
        }
        technology = @($technology | ForEach-Object { Get-StandardPage $zip $_ "technology" })
        buildings = @($buildings | ForEach-Object { Get-StandardPage $zip $_ "buildings" })
        solutions = @($solutions | ForEach-Object { Get-StandardPage $zip $_ "solutions" })
        portfolio = @{
            title = $portfolioText[13]
            supportingHeadline = $portfolioText[14]
            heroDescription = $portfolioText[15]
            filters = @($portfolioText[16..22])
            projects = $projects
            closingTitle = $portfolioText[53]
            closingDescription = $portfolioText[54]
            closingCta = $portfolioText[55]
            seoTitle = $portfolioNotes.seoTitle
            seoDescription = $portfolioNotes.seoDescription
            longForm = $portfolioNotes.longForm
        }
    }

    $output = Join-Path (Get-Location) $OutputPath
    $directory = Split-Path $output -Parent
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
    $json = $result | ConvertTo-Json -Depth 12
    [System.IO.File]::WriteAllText($output, $json, [System.Text.UTF8Encoding]::new($false))
    Write-Output "Extracted Green Electric deck content to $output"
} finally {
    $zip.Dispose()
}
