"""
Placeholder for GEE service tests - filled in during the pipeline phase
once services/gee_service.py has real computation functions.
"""
import pytest


def test_init_gee_raises_without_config(monkeypatch):
    from services import gee_service

    monkeypatch.setattr(gee_service, "_initialized", False)
    monkeypatch.setattr(
        "config.get_settings",
        lambda: type(
            "S", (), {"gee_service_account_email": None, "gee_service_account_key_path": None}
        )(),
    )
    with pytest.raises(RuntimeError):
        gee_service.init_gee()
