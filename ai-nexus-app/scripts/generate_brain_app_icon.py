from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
BRANDING_DIR = ROOT / "assets" / "branding"
APP_ICON_DIR = ROOT / "src" / "static" / "app-icons"


NAVY = "#0B2F66"
SLATE = "#3D5368"
BLUE = "#4294FF"
LIGHT_BLUE = "#5DB2FF"
WHITE = "#FFFFFF"
BG = "#F8FAFD"
SHADOW = (17, 37, 69, 30)


def cubic_bezier(p0, p1, p2, p3, steps=80):
    points = []
    for i in range(steps + 1):
        t = i / steps
        mt = 1 - t
        x = (
            mt**3 * p0[0]
            + 3 * mt**2 * t * p1[0]
            + 3 * mt * t**2 * p2[0]
            + t**3 * p3[0]
        )
        y = (
            mt**3 * p0[1]
            + 3 * mt**2 * t * p1[1]
            + 3 * mt * t**2 * p2[1]
            + t**3 * p3[1]
        )
        points.append((x, y))
    return points


def scale_points(points, size):
    return [(x * size / 1024.0, y * size / 1024.0) for x, y in points]


def draw_path(draw, points, width, fill):
    draw.line(points, fill=fill, width=width, joint="curve")


def make_icon(size):
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))

    shadow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    inset = int(size * 0.08)
    radius = int(size * 0.22)
    shadow_draw.rounded_rectangle(
        (inset, inset + int(size * 0.015), size - inset, size - inset + int(size * 0.015)),
        radius=radius,
        fill=SHADOW,
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=int(size * 0.03)))
    image.alpha_composite(shadow)

    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle(
        (inset, inset, size - inset, size - inset),
        radius=radius,
        fill=BG,
    )

    outer_segments = [
        ((220, 640), (120, 560), (110, 360), (220, 280)),
        ((220, 280), (260, 180), (420, 150), (500, 190)),
        ((500, 190), (560, 140), (700, 150), (760, 220)),
        ((760, 220), (860, 230), (920, 340), (910, 470)),
        ((910, 470), (930, 600), (850, 710), (730, 720)),
        ((730, 720), (660, 730), (610, 790), (595, 880)),
        ((595, 880), (560, 880), (525, 880), (490, 880)),
        ((490, 880), (480, 800), (455, 748), (400, 720)),
        ((400, 720), (305, 740), (235, 710), (220, 640)),
    ]

    outer_points = []
    for index, segment in enumerate(outer_segments):
        points = cubic_bezier(*segment, steps=70)
        if index > 0:
            points = points[1:]
        outer_points.extend(points)

    stem_segments = [
        ((510, 878), (510, 900), (510, 926), (510, 944)),
        ((510, 944), (540, 944), (570, 944), (602, 944)),
    ]
    stem_points = []
    for index, segment in enumerate(stem_segments):
        points = cubic_bezier(*segment, steps=30)
        if index > 0:
            points = points[1:]
        stem_points.extend(points)

    dark_width = max(10, int(size * 0.038))
    light_width = max(6, int(size * 0.022))
    inner_width = max(5, int(size * 0.02))

    draw_path(draw, scale_points(outer_points, size), dark_width, NAVY)
    draw_path(draw, scale_points(stem_points, size), dark_width, NAVY)

    accent_segments = [
        ((214, 638), (150, 582), (140, 420), (215, 300)),
        ((215, 300), (268, 210), (405, 182), (496, 204)),
        ((496, 204), (560, 172), (694, 180), (748, 236)),
        ((748, 236), (830, 240), (888, 334), (886, 452)),
        ((886, 452), (896, 560), (838, 664), (748, 704)),
    ]

    accent_points = []
    for index, segment in enumerate(accent_segments):
        points = cubic_bezier(*segment, steps=55)
        if index > 0:
            points = points[1:]
        accent_points.extend(points)

    draw_path(draw, scale_points(accent_points, size), light_width, BLUE)

    inner_paths = [
        [(256, 388), (320, 388), (384, 388)],
        [(284, 332), (334, 268), (430, 264)],
        [(346, 472), (412, 472), (466, 424)],
        [(285, 544), (305, 596), (305, 660)],
        [(480, 720), (518, 612), (640, 560), (794, 560)],
        [(546, 205), (546, 328), (546, 468)],
        [(654, 206), (620, 292), (630, 418)],
        [(717, 332), (812, 332), (848, 420)],
        [(672, 504), (740, 504), (806, 504)],
        [(574, 604), (650, 640), (772, 652)],
    ]

    inner_colors = [SLATE, BLUE, SLATE, BLUE, SLATE, SLATE, BLUE, SLATE, BLUE, SLATE]

    for path, color in zip(inner_paths, inner_colors):
        draw_path(draw, scale_points(path, size), inner_width, color)

    return image


def save_all():
    BRANDING_DIR.mkdir(parents=True, exist_ok=True)
    APP_ICON_DIR.mkdir(parents=True, exist_ok=True)

    icon_1024 = make_icon(1024)
    icon_1024.save(BRANDING_DIR / "app-icon-brain-1024.png")

    for name, size in {
        "android-hdpi.png": 72,
        "android-xhdpi.png": 96,
        "android-xxhdpi.png": 144,
        "android-xxxhdpi.png": 192,
    }.items():
        resized = icon_1024.resize((size, size), Image.Resampling.LANCZOS)
        resized.save(APP_ICON_DIR / name)


if __name__ == "__main__":
    save_all()
