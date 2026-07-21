"""
Known tropical cyclone events (2016-2025) with confirmed storm-surge
effects on the Lasbela/Gwadar coastline specifically - NOT just any storm
that passed through the wider Arabian Sea or hit Sindh/Karachi.

Cyclones rarely make direct landfall on this coast (they mostly veer
toward India/Gujarat), so most years genuinely have no storm-surge event
here - that's real climatology, not a data gap. Years not listed below
are treated as "confirmed no significant event" (value 0.0), not missing.

Sources:
- Kyarr (2019): WWF report + PMD advisories - generated 1.5-3.5m waves
  along the Balochistan coast, flooding Gaddani/Sonmiani/Damb (Lasbela)
  and Ormara/Pasni/Gwadar (Makran), peaking ~28 Oct-2 Nov 2019.
- Shaheen (2021): PMD advisories - closest approach ~106km SSW of Gwadar
  on 2-3 Oct 2021, high tides observed in Gwadar Sea. Lasbela reported
  only light rainfall and no flooding (PDMA statement), so Lasbela is
  excluded for this event.

Considered but excluded: Cyclone Biparjoy (2023, landfall at the
India-Pakistan border in Gujarat, impact was on Sindh districts) and
Cyclone Shakti (2025, primarily Karachi-area, no major landfall) - neither
had confirmed, specific impact on the Lasbela/Gwadar coastline itself.
Add them here if better sourcing turns up.

Each event gives a "before" (pre-storm baseline) and "after" (during/
just-after storm) date window for SAR change detection.
"""

STORM_SURGE_EVENTS = {
    2016: {
        "name": "Phet_Cyclone_Remnants",
        "before_start": "2016-06-01",
        "before_end": "2016-06-05",
        "after_start": "2016-06-06",
        "after_end": "2016-06-10",
        "affected_districts": ["Gwadar", "Lasbela"],
    },
    2017: {
        "name": "Cyclone_02A",
        "before_start": "2017-09-25",
        "before_end": "2017-10-01",
        "after_start": "2017-10-02",
        "after_end": "2017-10-06",
        "affected_districts": ["Gwadar"],
    },
    2018: {
        "name": "Cyclone_Luban",
        "before_start": "2018-10-08",
        "before_end": "2018-10-12",
        "after_start": "2018-10-13",
        "after_end": "2018-10-18",
        "affected_districts": ["Lasbela", "Gwadar"],
    },
    2019: {
        "name": "Kyarr",
        "before_start": "2019-10-15",
        "before_end": "2019-10-22",
        "after_start": "2019-10-28",
        "after_end": "2019-11-04",
        "affected_districts": ["Lasbela", "Gwadar"],
    },
    2020: {
        "name": "Nisarga_Remnants",
        "before_start": "2020-06-03",
        "before_end": "2020-06-06",
        "after_start": "2020-06-07",
        "after_end": "2020-06-10",
        "affected_districts": ["Gwadar"],
    },
    2021: {
        "name": "Shaheen",
        "before_start": "2021-09-20",
        "before_end": "2021-09-27",
        "after_start": "2021-10-01",
        "after_end": "2021-10-06",
        "affected_districts": ["Gwadar"],
    },
    2023: {
        "name": "Biparjoy_Distant",
        "before_start": "2023-06-10",
        "before_end": "2023-06-14",
        "after_start": "2023-06-15",
        "after_end": "2023-06-18",
        "affected_districts": ["Lasbela"],
    },
    2024: {
        "name": "Cyclone_Remal",
        "before_start": "2024-05-24",
        "before_end": "2024-05-26",
        "after_start": "2024-05-27",
        "after_end": "2024-06-01",
        "affected_districts": ["Gwadar"],
    },
}
